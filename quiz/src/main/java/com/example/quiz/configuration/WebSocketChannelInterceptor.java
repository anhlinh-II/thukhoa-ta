package com.example.quiz.configuration;

import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class WebSocketChannelInterceptor implements ChannelInterceptor {
    
    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
        
        if (StompCommand.SEND.equals(accessor.getCommand())) {
            String destination = accessor.getDestination();
            log.info("📨 STOMP SEND intercepted - Destination: {}, Payload: {}", 
                destination, new String((byte[]) message.getPayload()));
        } else if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
            log.info("📬 STOMP SUBSCRIBE - Destination: {}", accessor.getDestination());
        } else if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            log.info("🔌 STOMP CONNECT received");
        } else if (StompCommand.DISCONNECT.equals(accessor.getCommand())) {
            log.info("🔌 STOMP DISCONNECT received");
        }
        
        return message;
    }
}
