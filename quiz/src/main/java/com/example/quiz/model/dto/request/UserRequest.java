package com.example.quiz.model.dto.request;

import com.example.quiz.enums.Gender;
import com.example.quiz.validators.dobConstraint.DobConstraint;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level=AccessLevel.PRIVATE)
public class UserRequest {
    Long id;
    
    @Size(min = 4, message = "USERNAME_INVALID")
    String username;
    
    @Size(min = 8, message = "PASSWORD_INVALID")
    String password;
    String email;
    String firstName;
    String lastName;
    String phone;

    @DobConstraint(min = 16, message = "INVALID_DOB")
    Instant dob;

    Gender gender;

}
