package com.clickme.dto.admin;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ChangeStatusRequest {
    @NotNull(message = "Active status is required")
    private Boolean active;
}
