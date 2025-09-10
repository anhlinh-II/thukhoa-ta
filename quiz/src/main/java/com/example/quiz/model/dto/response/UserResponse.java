package com.example.quiz.model.dto.response;

import com.example.quiz.enums.Gender;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level=AccessLevel.PRIVATE)
public class UserResponse {
     Long id;

     String username;
     String email;
     String firstName;
     String lastName;
     String phone;
     String avatarUrl;

     Instant dob;
     Instant createdAt;
     Instant updatedAt;
     
     Gender gender;
     String bio;

     int groupNum;
     int friendNum;
     Long mutualFriendsNum;
}
