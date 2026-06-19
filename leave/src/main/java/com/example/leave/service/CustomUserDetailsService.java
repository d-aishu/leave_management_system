package com.example.leave.service;

import com.example.leave.entity.Employee;
import com.example.leave.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;
@Service
@RequiredArgsConstructor
@Slf4j
public class CustomUserDetailsService implements UserDetailsService {

    private final EmployeeRepository employeeRepository;

    @Override
public UserDetails loadUserByUsername(String email)
        throws UsernameNotFoundException {

    log.info("Loading user from database: {}", email);

    Employee employee =
            employeeRepository.findByEmail(email)
                    .orElseThrow(() ->
                            new UsernameNotFoundException(
                                    "User not found: " + email));

    return User.builder()
            .username(employee.getEmail())
            .password(employee.getPassword())
            .authorities(
                    new SimpleGrantedAuthority(
                            employee.getRole().name()))
            .build();
    }
}