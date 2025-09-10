package com.example.quiz.utils;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class EmailUtil {

     private final JavaMailSender javaMailSender;

     public void sendOtpEmail(String email, String otp) throws MessagingException {
          MimeMessage mimeMessage = javaMailSender.createMimeMessage();
          MimeMessageHelper mimeMessageHelper = new MimeMessageHelper(mimeMessage);

          mimeMessageHelper.setTo(email);
          mimeMessageHelper.setSubject("Verify OTP");

          String messageContent = """
                        <div style="font-family: Arial, sans-serif; color: #333;">
                            <div style="padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 400px; margin: auto; text-align: center;">
                                <h2 style="color: #4CAF50; font-size: 24px;">Your Verification OTP</h2>
                                <p style="font-size: 16px; color: #555; margin-top: 10px;">
                                    Use the OTP below to verify your email address:
                                </p>
                                <p style="font-size: 24px; color: #333; font-weight: bold; letter-spacing: 2px; margin: 20px 0;">
                                    %s
                                </p>
                                <p style="font-size: 14px; color: #777;">
                                    This OTP will expire in 5 minutes. Do not share it with anyone.
                                </p>
                            </div>
                        </div>
                    """
                    .formatted(otp);

          mimeMessageHelper.setText(messageContent, true);

          javaMailSender.send(mimeMessage);
     }

     public void sendResetPasswordEmail(String email, String resetUrl) throws MessagingException {
          MimeMessage mimeMessage = javaMailSender.createMimeMessage();
          MimeMessageHelper mimeMessageHelper = new MimeMessageHelper(mimeMessage);

          mimeMessageHelper.setTo(email);
          mimeMessageHelper.setSubject("Reset Your Password");

          String messageContent = """
                        <div style="font-family: Arial, sans-serif; color: #333;">
                            <div style="padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 500px; margin: auto;">
                                <h2 style="color: #FF6B6B; font-size: 24px; text-align: center;">Reset Your Password</h2>
                                <p style="font-size: 16px; color: #555; margin-top: 15px;">
                                    Hello,
                                </p>
                                <p style="font-size: 16px; color: #555;">
                                    We received a request to reset your password. Click the button below to create a new password:
                                </p>
                                <div style="text-align: center; margin: 30px 0;">
                                    <a href="%s" style="background-color: #FF6B6B; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-size: 16px; display: inline-block;">
                                        Reset Password
                                    </a>
                                </div>
                                <p style="font-size: 14px; color: #777;">
                                    This link will expire in 15 minutes for security reasons.
                                </p>
                                <p style="font-size: 14px; color: #777;">
                                    If you didn't request this password reset, please ignore this email.
                                </p>
                                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                                <p style="font-size: 12px; color: #999; text-align: center;">
                                    Quiz Application Team
                                </p>
                            </div>
                        </div>
                    """
                    .formatted(resetUrl);

          mimeMessageHelper.setText(messageContent, true);

          javaMailSender.send(mimeMessage);
     }
}
