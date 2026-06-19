package com.example.leave.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class EmployeeRequestDto {

    private String name;
    private String email;
    private String department;
    private Integer leaveBalance;
    private String password;
}