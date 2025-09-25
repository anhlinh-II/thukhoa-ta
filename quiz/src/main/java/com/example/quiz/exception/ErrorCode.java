package com.example.quiz.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@AllArgsConstructor
@NoArgsConstructor
@Getter
public enum ErrorCode {

    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),

    INVALID_KEY(1001, "Uncategorized error", HttpStatus.BAD_REQUEST),

    ENTITY_EXISTED(1002, "Entity existed!", HttpStatus.BAD_REQUEST),

    USERNAME_INVALID(1003, "Username must be at least 4 characters", HttpStatus.UNAUTHORIZED),

    PASSWORD_INVALID(1004, "Password must be at least 8 characters", HttpStatus.UNAUTHORIZED),

    ENTITY_NOT_EXISTED(1005, "Entity not existed", HttpStatus.NOT_FOUND),

    UNAUTHENTICATED(1006, "User not authenticated", HttpStatus.UNAUTHORIZED),

    UNAUTHORIZED(1007, "You do not have permission", HttpStatus.FORBIDDEN),

    INVALID_ACTION(1008, "Invalid action that cannot be done", HttpStatus.EXPECTATION_FAILED),

    INVALID_DOB(1009, "You must be at least 16 years old", HttpStatus.BAD_REQUEST),

    NO_REFRESH_TOKEN(1010, "You don't have refresh token in cookies", HttpStatus.BAD_REQUEST),

    INVALID_ACCESS_TOKEN(1011, "Your access token is not valid", HttpStatus.BAD_REQUEST),

    ERROR_EMAIL(1012, "Some error occur when sending email", HttpStatus.INTERNAL_SERVER_ERROR),

    INVALID_OTP(1013, "Invalid OTP", HttpStatus.BAD_REQUEST),

    EXPIRED_OTP(1014, "OTP is expired", HttpStatus.BAD_REQUEST),

    MEMBER_ALREADY_EXISTS(1015, "Member is already existed", HttpStatus.BAD_REQUEST),

    NOT_ADMIN(1016,"You are not an admin" , HttpStatus.BAD_REQUEST),

    NOT_MEMBER(1017, "You are not a member of this group", HttpStatus.BAD_REQUEST),

    CANT_DELETE(1018, "You can not delete other people's message", HttpStatus.BAD_REQUEST),

    EMAIL_ALREADY_EXISTS_WITH_GOOGLE(1019, "This email is already registered with Google. Please login with Google.", HttpStatus.BAD_REQUEST),
    
    PASSWORD_NOT_MATCH(1020, "Password and confirm password do not match", HttpStatus.BAD_REQUEST),
    
    INVALID_TOKEN(1021, "Invalid or expired reset token", HttpStatus.BAD_REQUEST),
    
    TOKEN_EXPIRED(1022, "Reset token has expired", HttpStatus.BAD_REQUEST),
    
    USER_NOT_EXISTED(1023, "User with this email does not exist", HttpStatus.NOT_FOUND),
    
    FORBIDDEN(1024, "Access denied - Insufficient permissions", HttpStatus.FORBIDDEN),

    ENTITY_NOT_A_TREE(1025, "Entity does not have parentId property", HttpStatus.BAD_REQUEST),
    
    // Quiz related errors
    QUIZ_GROUP_NOT_FOUND(2001, "Quiz group not found", HttpStatus.NOT_FOUND),
    
    PROGRAM_NOT_FOUND(2002, "Program not found", HttpStatus.NOT_FOUND),
    
    SLUG_ALREADY_EXISTS(2003, "Slug already exists", HttpStatus.BAD_REQUEST),
    
    QUIZ_FORMAT_NOT_FOUND(2004, "Quiz format not found", HttpStatus.NOT_FOUND),
    
    QUIZ_TOPIC_NOT_FOUND(2005, "Quiz topic not found", HttpStatus.NOT_FOUND),
    
    QUIZ_MOCK_TEST_NOT_FOUND(2006, "Quiz mock test not found", HttpStatus.NOT_FOUND);

    private int code;
    private String message;
    private HttpStatusCode httpStatusCode;
}
