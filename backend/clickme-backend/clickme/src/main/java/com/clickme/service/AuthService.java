package com.clickme.service;

import com.clickme.dto.request.LoginRequest;
import com.clickme.dto.request.SignupRequest;
import com.clickme.dto.response.AuthResponse;
import com.clickme.dto.response.UserResponse;

public interface AuthService {

    AuthResponse signup(SignupRequest request);

    AuthResponse login(LoginRequest request);

    UserResponse getCurrentUser();
   
}