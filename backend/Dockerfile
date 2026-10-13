# =========================================================
# Stage 1: Build the application with Maven
# =========================================================
FROM eclipse-temurin:17-jdk-alpine AS build

WORKDIR /app

# Copy Maven wrapper and pom.xml first (for Docker layer caching)
COPY pom.xml .

# Download dependencies (cached unless pom.xml changes)
RUN apk add --no-cache maven && \
    mvn dependency:go-offline -B

# Copy source code and build
COPY src ./src
RUN mvn clean package -DskipTests -B

# =========================================================
# Stage 2: Run the application on a lightweight JRE
# =========================================================
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Create a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy the built JAR from the build stage
COPY --from=build /app/target/*.jar app.jar

# Create logs directory
RUN mkdir -p logs && chown -R appuser:appgroup /app

USER appuser

# Render sets the PORT environment variable
EXPOSE 8080

# JVM tuning for Render's free tier (512MB RAM)
ENTRYPOINT ["java", \
    "-XX:+UseContainerSupport", \
    "-XX:MaxRAMPercentage=75.0", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "-jar", "app.jar"]
