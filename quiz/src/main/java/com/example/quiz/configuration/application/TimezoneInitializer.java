package com.example.quiz.configuration.application;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.TimeZone;

@Component
public class TimezoneInitializer {

    private static final Logger log = LoggerFactory.getLogger(TimezoneInitializer.class);

    @PostConstruct
    public void init() {
        TimeZone tz = TimeZone.getTimeZone("Asia/Ho_Chi_Minh");
        TimeZone.setDefault(tz);
        log.info("Default JVM timezone set to {}", tz.getID());
    }
}
