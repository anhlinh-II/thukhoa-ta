package com.example.quiz.base.impl;

import com.example.quiz.base.baseInterface.BaseService;
import com.example.quiz.validators.requirePermission.RequirePermission;
import com.example.quiz.model.dto.request.RequestPagingDto;
import com.example.quiz.model.dto.response.ApiResponse;
import com.example.quiz.model.dto.response.PagingResponseDto;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
public abstract class BaseController<E, ID, R, P, V, S> {
    
    protected BaseService<E, ID, R, P, V> baseService;
    protected S service;

    @Value("${spring.security.oauth2.client.registration.google.redirect-uri:http://localhost:8080/login/oauth2/code/google}")
    private String googleRedirectUri;

    @Value("${app.oauth2.authorizedRedirectUri:http://localhost:3000/oauth2/redirect}")
    private String authorizedRedirectUri;

    @SuppressWarnings("unchecked")
    protected BaseController(BaseService<E, ID, R, P, V> service) {
        this.baseService = service;
        this.service = (S) service;
    }
    
    // Default constructor
    protected BaseController() {
    }

    @GetMapping("/all")
    @RequirePermission(resource = "", action = "READ")
    public ApiResponse<List<P>> findAll() {
          return ApiResponse.successOf(baseService.findAll());
    }

    @GetMapping("/paged")
    @RequirePermission(resource = "", action = "READ")
    public ApiResponse<Page<P>> findAllPaged(Pageable pageable) {
        return ApiResponse.successOf(baseService.getAll(pageable));
    }

    @GetMapping("/{id}")
    @RequirePermission(resource = "", action = "READ")
    public ApiResponse<P> findById(@PathVariable ID id) {
        return ApiResponse.successOf(baseService.getById(id));
    }

    @PostMapping("/create")
    @ResponseStatus(HttpStatus.CREATED)
    @RequirePermission(resource = "", action = "CREATE")
    public ApiResponse<P> create(@Valid @RequestBody R request) {
        return ApiResponse.successOf(baseService.create(request));
    }

    @PutMapping("/edit/{id}")
    @RequirePermission(resource = "", action = "UPDATE")
    public ApiResponse<P> update(@PathVariable ID id, @Valid @RequestBody R request) {
        return ApiResponse.successOf(baseService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @RequirePermission(resource = "", action = "DELETE")
    public ApiResponse<Boolean> delete(@PathVariable ID id) {
        baseService.delete(id);
        return ApiResponse.successOf(Boolean.TRUE);
    }

    @GetMapping("/views/{id}")
    @RequirePermission(resource = "", action = "READ")
    public ApiResponse<V> getViewById(@PathVariable ID id) {
        return ApiResponse.successOf(baseService.getViewById(id));
    }

    @GetMapping("/views")
    @RequirePermission(resource = "", action = "READ")
    public ApiResponse<Page<V>> getViewsPaged(Pageable pageable) {
        return ApiResponse.successOf(baseService.getViewPaging(pageable));
    }

    @PostMapping("/views/list")
    @RequirePermission(resource = "", action = "READ")
    public ApiResponse<PagingResponseDto<Map<String, Object>>> getViewsPaged(@Valid @RequestBody RequestPagingDto request) {
        PagingResponseDto<Map<String, Object>> result = baseService.getViewPagingWithFilter(request);
        return ApiResponse.successOf(result);
    }

    @GetMapping("/tree")
    @RequirePermission(resource = "", action = "READ")
    public ApiResponse<List<Map<String, Object>>> getTree(
            @RequestParam(required = false) String parentId,
            @RequestParam(required = false) String filter) {
        
        // If parentId is provided, get direct children
        if (parentId != null) {
            List<Map<String, Object>> children = baseService.getChildren(parentId);
            return ApiResponse.successOf(children);
        }

        // Build request with filter if present
        RequestPagingDto request = new RequestPagingDto();
        if (filter != null && !filter.trim().isEmpty()) {
            request.setFilter(filter);
        }

        log.info("=================================================");
        log.info("OAuth2 Configuration:");
        log.info("GOOGLE_REDIRECT_URI: {}", googleRedirectUri);
        log.info("OAUTH2_AUTHORIZED_REDIRECT_URI: {}", authorizedRedirectUri);
        log.info("=================================================");

        // Call unified getTree() - it handles both list all and search
        List<Map<String, Object>> tree = baseService.getTree(request);
        return ApiResponse.successOf(tree);
    }
}

