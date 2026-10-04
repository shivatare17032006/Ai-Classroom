package com.aiclassroom.config;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Enterprise Rate Limiting & DoS Protection Filter
 * Sliding Window Token Bucket per Client IP
 */
@Component
@Order(1)
public class RateLimitingFilter implements Filter {

    private static final Logger log = LoggerFactory.getLogger(RateLimitingFilter.class);

    private static final int MAX_REQUESTS_PER_MINUTE = 500;
    private static final long ONE_MINUTE_MS = 60_000L;

    private static class ClientRequestTracker {
        final AtomicLong windowStartTime = new AtomicLong(System.currentTimeMillis());
        final AtomicInteger requestCount = new AtomicInteger(0);
    }

    private final Map<String, ClientRequestTracker> clientTrackers = new ConcurrentHashMap<>();

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        String clientIp = getClientIp(httpRequest);
        long currentTime = System.currentTimeMillis();

        ClientRequestTracker tracker = clientTrackers.computeIfAbsent(clientIp, k -> new ClientRequestTracker());

        synchronized (tracker) {
            if (currentTime - tracker.windowStartTime.get() > ONE_MINUTE_MS) {
                tracker.windowStartTime.set(currentTime);
                tracker.requestCount.set(0);
            }

            int currentRequests = tracker.requestCount.incrementAndGet();
            int remaining = Math.max(0, MAX_REQUESTS_PER_MINUTE - currentRequests);
            long resetMs = tracker.windowStartTime.get() + ONE_MINUTE_MS - currentTime;

            httpResponse.setHeader("X-RateLimit-Limit", String.valueOf(MAX_REQUESTS_PER_MINUTE));
            httpResponse.setHeader("X-RateLimit-Remaining", String.valueOf(remaining));
            httpResponse.setHeader("X-RateLimit-Reset-Ms", String.valueOf(resetMs));

            if (currentRequests > MAX_REQUESTS_PER_MINUTE) {
                log.warn("[RateLimiter] Rate limit exceeded for IP: {}. Requests in window: {}", clientIp, currentRequests);
                httpResponse.setStatus(429); // HTTP 429 Too Many Requests
                httpResponse.setContentType("application/json");
                httpResponse.getWriter().write("""
                    {
                        "error": "Too Many Requests",
                        "message": "Rate limit exceeded. Maximum 500 requests per minute allowed.",
                        "retryAfterMs": %d
                    }
                    """.formatted(resetMs));
                return;
            }
        }

        chain.doFilter(request, response);
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr() != null ? request.getRemoteAddr() : "127.0.0.1";
    }
}
