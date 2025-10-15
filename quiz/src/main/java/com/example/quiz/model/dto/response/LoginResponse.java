package com.example.quiz.model.dto.response;

import com.example.quiz.model.entity.role_permission.Role;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
public class LoginResponse {
     @JsonProperty("access_token")
     private String access_token;
     private UserLogin user;

     @Data
     @AllArgsConstructor
     @NoArgsConstructor
     public static class UserLogin {

          private long id;
          private String email;
          private String username;
          private String location;
          private String bio;
          private boolean isActive;
          private Set<Role> authorities;
          private String avatarUrl;

          public UserLogin(Long id, String email, String username, String location, String bio, int postNum2,
                    int likeNum2, boolean isActive, Set<Role> authorities, String firstName, String lastName, String avatarUrl) {
               this.id = id;
               this.email = email;
               this.username = username;
               this.location = location;
               this.isActive = isActive;
               this.authorities = authorities;
               this.avatarUrl = avatarUrl;
          }

          public UserLogin(Long id, String email, String username, String location, String bio, boolean active, String avatarUrl) {
               this.id = id;
               this.email = email;
               this.username = username;
               this.location = location;
               this.bio = bio;
               this.isActive = active;
               this.avatarUrl = avatarUrl;
          }
     }

     @Data
     @AllArgsConstructor
     @NoArgsConstructor
     public static class UserGetAccount {
          private UserLogin user;
     }

     @Data
     @AllArgsConstructor
     @NoArgsConstructor
     public static class UserInsideToken {
          private long id;
          private String email;
          private String username;
          private String location;
     }
}
