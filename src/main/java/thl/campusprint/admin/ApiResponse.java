package thl.campusprint.admin;


import lombok.Getter;

@Getter
public class ApiResponse {
    private final boolean ok;
    private final String error;

    private ApiResponse(boolean ok, String error) {
        this.ok = ok;
        this.error = error;
    }

    public static ApiResponse ok() {
        return new ApiResponse(true, null);
    }

    public static ApiResponse fail(String code) {
        return new ApiResponse(false, code);
    }
}
