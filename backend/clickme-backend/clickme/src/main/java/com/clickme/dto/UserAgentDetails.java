package com.clickme.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserAgentDetails {

    private String browser;

    private String browserVersion;

    private String operatingSystem;

    private String device;

}