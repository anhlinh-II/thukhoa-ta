package com.example.quiz.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.Getter;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
public class CuratedPoolLoader {

    private final ObjectMapper mapper = new ObjectMapper();

    @Getter
    private List<Map<String, Object>> pool = new ArrayList<>();

    @PostConstruct
    public void load() {
        try {
            ClassPathResource res = new ClassPathResource("curated_vocab_pool.json");
            InputStream is = res.getInputStream();
            List<Map<String, Object>> items = mapper.readValue(is, new TypeReference<List<Map<String,Object>>>(){});
            if (items != null) pool = items;
        } catch (Exception e) {
            // ignore, keep empty pool
            e.printStackTrace();
        }
    }
}
