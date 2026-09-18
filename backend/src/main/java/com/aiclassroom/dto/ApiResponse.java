package com.aiclassroom.dto;

public class ApiResponse<T> {
    private boolean success;
    private String message;
    private String error;
    private T data;

    public ApiResponse() {
    }

    public ApiResponse(boolean success, String message, String error, T data) {
        this.success = success;
        this.message = message;
        this.error = error;
        this.data = data;
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getError() { return error; }
    public void setError(String error) { this.error = error; }

    public T getData() { return data; }
    public void setData(T data) { this.data = data; }

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, null, null, data);
    }

    public static <T> ApiResponse<T> success(T data, String message) {
        return new ApiResponse<>(true, message, null, data);
    }

    public static <T> ApiResponse<T> error(String errorMessage) {
        return new ApiResponse<>(false, null, errorMessage, null);
    }
}
