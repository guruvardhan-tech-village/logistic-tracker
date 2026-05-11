package com.logistics.fleet.service;

import com.logistics.fleet.config.JwtTokenProvider;
import com.logistics.fleet.model.dto.JwtAuthResponse;
import com.logistics.fleet.model.dto.LoginRequest;
import com.logistics.fleet.model.dto.UserDto;
import com.logistics.fleet.model.entity.User;
import com.logistics.fleet.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public JwtAuthResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String token = jwtTokenProvider.generateToken(authentication);

        User user = userRepository.findByUsername(loginRequest.getUsername()).orElseThrow();
        
        UserDto userDto = new UserDto();
        userDto.setId(user.getId());
        userDto.setUsername(user.getUsername());
        userDto.setRole(user.getRole());

        JwtAuthResponse response = new JwtAuthResponse();
        response.setAccessToken(token);
        response.setUser(userDto);
        return response;
    }

    public String registerUser(UserDto userDto, String plainPassword) {
        if (userRepository.findByUsername(userDto.getUsername()).isPresent()) {
            throw new RuntimeException("Username is already taken!");
        }

        User user = User.builder()
                .username(userDto.getUsername())
                .password(passwordEncoder.encode(plainPassword))
                .role(userDto.getRole())
                .build();

        userRepository.save(user);

        return "User registered successfully.";
    }
}
