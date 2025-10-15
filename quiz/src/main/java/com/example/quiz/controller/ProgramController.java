package com.example.quiz.controller;

import com.example.quiz.base.impl.BaseController;
import com.example.quiz.validators.requirePermission.ResourceController;
import com.example.quiz.model.entity.program.ProgramRequestDto;
import com.example.quiz.model.entity.program.ProgramResponseDto;
import com.example.quiz.model.entity.program.Program;
import com.example.quiz.model.entity.program.ProgramView;
import com.example.quiz.service.program.ProgramService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/programs")
@ResourceController("PROGRAM")
@Slf4j
public class ProgramController extends BaseController<Program, Long, ProgramRequestDto, ProgramResponseDto, ProgramView, ProgramService> {

    public ProgramController(ProgramService programService) {
        super(programService);
    }
}
