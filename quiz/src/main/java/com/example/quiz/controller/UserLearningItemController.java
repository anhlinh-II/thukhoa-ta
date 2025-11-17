package com.example.quiz.controller;

import com.example.quiz.base.impl.BaseController;
import com.example.quiz.model.entity.user_learning_item.UserLearningItem;
import com.example.quiz.model.entity.user_learning_item.UserLearningItemRequest;
import com.example.quiz.model.entity.user_learning_item.UserLearningItemResponse;
import com.example.quiz.model.entity.user_learning_item.UserLearningItemView;
import com.example.quiz.service.user_learning_item.UserLearningItemService;
import com.example.quiz.enums.LearningType;
import com.example.quiz.utils.SecurityUtils;
import com.example.quiz.service.interfaces.UserService;
import com.example.quiz.validators.requirePermission.ResourceController;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.http.ResponseEntity;
import com.example.quiz.model.dto.response.ApiResponse;


@RestController
@RequestMapping("/api/v1/user-learning-items")
@ResourceController("USER_LEARNING_ITEM")
@Slf4j
public class UserLearningItemController extends BaseController<UserLearningItem, Long, UserLearningItemRequest, UserLearningItemResponse, UserLearningItemView, UserLearningItemService> {

    private final UserService userService;


    public UserLearningItemController(UserLearningItemService service, UserService userService) {
        super(service);
        this.userService = userService;
    }

    @GetMapping("/due")
    public ResponseEntity<ApiResponse<java.util.List<UserLearningItemResponse>>> getDueItems(@RequestParam(required = false) String type) {
        String username = SecurityUtils.getCurrentUserLogin().orElse("");
        Long userId = null;
        try {
            com.example.quiz.model.entity.user.User user = this.userService.handleGetUserByUsernameOrEmailOrPhone(username);
            if (user != null) userId = user.getId();
        } catch (Exception ex) {
            // ignore
        }
        if (userId == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "User not found"));
        }
        LearningType lt = LearningType.MOCKTEST;
        if (type != null && !type.isBlank()) {
            try { lt = LearningType.valueOf(type); } catch (Exception ignored) {}
        }
        java.util.List<UserLearningItemResponse> items = service.getDueItems(userId, lt);
        return ResponseEntity.ok(ApiResponse.successOf(items));
    }

    @PostMapping("/{id}/review")
    public ResponseEntity<ApiResponse<UserLearningItemResponse>> reviewItem(@PathVariable Long id, @RequestBody java.util.Map<String, Object> body) {
        Integer quality = null;
        try {
            Object q = body.get("quality");
            if (q instanceof Number) quality = ((Number) q).intValue();
            else if (q instanceof String) quality = Integer.parseInt((String) q);
        } catch (Exception ignored) {}
        if (quality == null) return ResponseEntity.badRequest().body(ApiResponse.error(400, "quality is required"));
        UserLearningItemResponse resp = service.updateReview(id, quality);
        return ResponseEntity.ok(ApiResponse.successOf(resp));
    }
}
