package com.example.leave.entity;

import com.example.leave.enums.Role;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
@Entity
@Table(name = "employees")
@Getter 
@Setter 
@NoArgsConstructor 
@AllArgsConstructor
@Builder
public class Employee extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    private String department;
    private String designation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Builder.Default
    @Column(name = "annual_balance")
    private Integer annualBalance = 18;

    @Builder.Default
    @Column(name = "sick_balance")
    private Integer sickBalance = 12;

    @Builder.Default
    @Column(name = "casual_balance")
    private Integer casualBalance = 6;

    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<LeaveRequest> leaveRequests = new ArrayList<>();
}