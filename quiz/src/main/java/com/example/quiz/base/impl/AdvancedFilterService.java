package com.example.quiz.base.impl;

import com.example.quiz.model.dto.request.FilterItemDto;
import com.example.quiz.model.dto.request.RequestPagingDto;
import com.example.quiz.model.dto.response.PagingResponseDto;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.annotations.Subselect;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.lang.reflect.Field;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdvancedFilterService {

    private final EntityManager entityManager;
    private final ObjectMapper objectMapper;

    public <T> PagingResponseDto<Map<String, Object>> getFilteredViewData(
            Class<T> viewClass, RequestPagingDto request) {

        try {
            // Build the base query
            StringBuilder queryBuilder = new StringBuilder("SELECT ");

            // Handle column selection - include both entity fields and BaseEntity fields
            List<String> allFields = new ArrayList<>();
            // Add declared fields from the entity
            Arrays.stream(viewClass.getDeclaredFields())
                    .map(field -> "e." + convertToSnakeCase(field.getName()))
                    .forEach(allFields::add);
            // Add BaseEntity fields (created_at, created_by, updated_at, updated_by)
            allFields.add("e.created_at");
            allFields.add("e.created_by");
            allFields.add("e.updated_at");
            allFields.add("e.updated_by");
            
            String selectClause = String.join(", ", allFields);
            queryBuilder.append(selectClause);

            // Get table name from entity
            String tableName = getTableName(viewClass);

            // If the view/table doesn't exist in the database, we'll attempt a
            // runtime fallback during execution (catch / retry) below rather than
            // checking metadata here.
            queryBuilder.append(" FROM ").append(tableName).append(" e");

            // Build WHERE clause from filters
            Map<String, Object> parameters = new HashMap<>();
            String whereClause = buildWhereClause(request.getFilter(), parameters);
            if (StringUtils.hasText(whereClause)) {
                queryBuilder.append(" WHERE ").append(whereClause);
            }

            // Build ORDER BY clause
            String orderClause = buildOrderClause(request.getSort());
            if (StringUtils.hasText(orderClause)) {
                queryBuilder.append(" ORDER BY ").append(orderClause);
            }

            // Create the main query and execute. If the view/table doesn't exist
            // the DB will throw an exception; in that case, if the name ends with
            // _view we try once more with the base table (without the suffix).
            List<Object[]> resultList;
            String sql = queryBuilder.toString();
            log.info("Filtered view SQL: {}", sql);
            log.info("Filtered view parameters: {}", parameters);

            try {
                Query query = entityManager.createNativeQuery(sql);
                // Set parameters
                parameters.forEach(query::setParameter);
                // Set pagination
                query.setFirstResult(request.getSkip());
                query.setMaxResults(request.getTake());
                @SuppressWarnings("unchecked")
                List<Object[]> tmp = query.getResultList();
                resultList = tmp;
            } catch (Exception ex) {
                // If the table is a view (endsWith _view) try fallback to base table
                if (tableName != null && tableName.endsWith("_view")) {
                    String baseTable = tableName.substring(0, tableName.length() - 5);
                    String fallbackSql = sql.replaceFirst("(?i)FROM\\s+" + tableName, "FROM " + baseTable);
                    log.info("Primary query failed ({}). Trying fallback SQL with base table '{}': {}", ex.getMessage(), baseTable, fallbackSql);
                    try {
                        Query fallbackQuery = entityManager.createNativeQuery(fallbackSql);
                        parameters.forEach(fallbackQuery::setParameter);
                        fallbackQuery.setFirstResult(request.getSkip());
                        fallbackQuery.setMaxResults(request.getTake());
                        @SuppressWarnings("unchecked")
                        List<Object[]> tmp2 = fallbackQuery.getResultList();
                        // update tableName so count uses same table
                        tableName = baseTable;
                        resultList = tmp2;
                    } catch (Exception ex2) {
                        log.error("Both primary and fallback queries failed: {}, {}", ex.getMessage(), ex2.getMessage());
                        throw new RuntimeException("Error executing filtered query", ex2);
                    }
                } else {
                    log.error("Filtered query failed: {}", ex.getMessage());
                    throw new RuntimeException("Error executing filtered query", ex);
                }
            }

            // Convert to Map format - include both entity fields and BaseEntity fields
            List<String> allColumnNames = new ArrayList<>();
            Arrays.stream(viewClass.getDeclaredFields())
                    .map(Field::getName)
                    .forEach(allColumnNames::add);
            // Add BaseEntity field names
            allColumnNames.add("createdAt");
            allColumnNames.add("createdBy");
            allColumnNames.add("updatedAt");
            allColumnNames.add("updatedBy");
            
            String[] columnNames = allColumnNames.toArray(new String[0]);
            List<Map<String, Object>> data = convertToMapList(resultList, columnNames);

            // Get total count if requested
            long total = 0;
            if (request.isGetTotal()) {
                total = getTotalCount(tableName, whereClause, parameters);
            }

            // Check if empty
            boolean empty = request.getSkip() == 0 && data.isEmpty() &&
                    StringUtils.hasText(request.getEmptyFilter());

            return PagingResponseDto.of(empty, data, total, new HashMap<>());

        } catch (Exception e) {
            throw new RuntimeException("Error executing filtered query", e);
        }
    }

    // private <T> String buildSelectClause(Class<T> viewClass, String columns) {
    //     if (!StringUtils.hasText(columns)) {
    //         return "*";
    //     }

    //     // Parse comma-separated columns and validate against entity fields
    //     String[] requestedColumns = columns.split(",");
    //     Set<String> validColumns = getValidColumns(viewClass);

    //     return Arrays.stream(requestedColumns)
    //             .map(String::trim)
    //             .filter(validColumns::contains)
    //             .map(col -> "e." + col)
    //             .collect(Collectors.joining(", "));
    // }

    // private <T> Set<String> getValidColumns(Class<T> viewClass) {
    //     return Arrays.stream(viewClass.getDeclaredFields())
    //             .map(Field::getName)
    //             .collect(Collectors.toSet());
    // }

    // private <T> String[] getColumnNames(Class<T> viewClass, String columns) {
    //     if (!StringUtils.hasText(columns)) {
    //         return Arrays.stream(viewClass.getDeclaredFields())
    //                 .map(Field::getName)
    //                 .toArray(String[]::new);
    //     }

    //     return Arrays.stream(columns.split(","))
    //             .map(String::trim)
    //             .toArray(String[]::new);
    // }

    private String buildWhereClause(String filterJson, Map<String, Object> parameters) {
        if (!StringUtils.hasText(filterJson)) {
            return "";
        }

        try {
            List<FilterItemDto> filters = objectMapper.readValue(
                    filterJson, new TypeReference<List<FilterItemDto>>() {
                    });

            return filters.stream()
                    .map(filter -> buildSingleFilter(filter, parameters))
                    .filter(StringUtils::hasText)
                    .collect(Collectors.joining(" AND "));

        } catch (Exception e) {
            throw new RuntimeException("Error parsing filter JSON", e);
        }
    }

    private String buildSingleFilter(FilterItemDto filter, Map<String, Object> parameters) {
        // Handle OR conditions when field/operator are null but ors is present
        if ((filter.getField() == null || filter.getOperator() == null) && 
            filter.getOrs() != null && !filter.getOrs().isEmpty()) {
            
            List<String> orConditions = filter.getOrs().stream()
                    .map(orFilter -> buildSingleFilter(orFilter, parameters))
                    .filter(StringUtils::hasText)
                    .collect(Collectors.toList());
            
            if (!orConditions.isEmpty()) {
                return "(" + String.join(" OR ", orConditions) + ")";
            }
            return "";
        }
        
        if (filter.getField() == null || filter.getOperator() == null) {
            return "";
        }

        String paramName = "param" + parameters.size();
        String fieldName = "e." + convertToSnakeCase(filter.getField());

        switch (filter.getOperator()) {
            case EQUALS:
                parameters.put(paramName, convertValue(filter.getValue(), filter.getDataType()));
                return fieldName + " = :" + paramName;

            case NOT_EQUALS:
                parameters.put(paramName, convertValue(filter.getValue(), filter.getDataType()));
                return fieldName + " != :" + paramName;

            case GREATER_THAN:
                parameters.put(paramName, convertValue(filter.getValue(), filter.getDataType()));
                return fieldName + " > :" + paramName;

            case GREATER_THAN_OR_EQUAL:
                parameters.put(paramName, convertValue(filter.getValue(), filter.getDataType()));
                return fieldName + " >= :" + paramName;

            case LESS_THAN:
                parameters.put(paramName, convertValue(filter.getValue(), filter.getDataType()));
                return fieldName + " < :" + paramName;

            case LESS_THAN_OR_EQUAL:
                parameters.put(paramName, convertValue(filter.getValue(), filter.getDataType()));
                return fieldName + " <= :" + paramName;

            case CONTAINS:
                parameters.put(paramName, "%" + filter.getValue() + "%");
                return fieldName + " LIKE :" + paramName;

            case NOT_CONTAINS:
                parameters.put(paramName, "%" + filter.getValue() + "%");
                return fieldName + " NOT LIKE :" + paramName;

            case STARTS_WITH:
                parameters.put(paramName, filter.getValue() + "%");
                return fieldName + " LIKE :" + paramName;

            case ENDS_WITH:
                parameters.put(paramName, "%" + filter.getValue());
                return fieldName + " LIKE :" + paramName;

            case IS_NULL:
                return fieldName + " IS NULL";

            case IS_NOT_NULL:
                return fieldName + " IS NOT NULL";

            case IN:
                if (filter.getValue() instanceof List) {
                    @SuppressWarnings("unchecked")
                    List<Object> values = (List<Object>) filter.getValue();
                    parameters.put(paramName, values);
                    return fieldName + " IN (:" + paramName + ")";
                }
                break;

            case NOT_IN:
                if (filter.getValue() instanceof List) {
                    @SuppressWarnings("unchecked")
                    List<Object> values = (List<Object>) filter.getValue();
                    parameters.put(paramName, values);
                    return fieldName + " NOT IN (:" + paramName + ")";
                }
                break;

            default:
                return "";
        }

        return "";
    }

    private Object convertValue(Object value, FilterItemDto.DataType dataType) {
        if (value == null || dataType == null) {
            return value;
        }

        String stringValue = value.toString();

        switch (dataType) {
            case NUMBER:
                try {
                    if (stringValue.contains(".")) {
                        return Double.parseDouble(stringValue);
                    } else {
                        return Long.parseLong(stringValue);
                    }
                } catch (NumberFormatException e) {
                    return value;
                }

            case BOOL:
                return Boolean.parseBoolean(stringValue);

            case DATETIME:
                try {
                    return LocalDateTime.parse(stringValue, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
                } catch (Exception e) {
                    return value;
                }

            case STRING:
            default:
                return stringValue;
        }
    }

    private String buildOrderClause(String sort) {
        if (!StringUtils.hasText(sort)) {
            return "";
        }

        return Arrays.stream(sort.split(","))
                .map(String::trim)
                .map(this::parseSortField)
                .filter(StringUtils::hasText)
                .collect(Collectors.joining(", "));
    }

    private String parseSortField(String sortField) {
        String[] parts = sortField.trim().split("\\s+");
        if (parts.length == 0) {
            return "";
        }

        // Convert field name to snake_case to match database columns
        String field = "e." + convertToSnakeCase(parts[0]);
        String direction = parts.length > 1 && "desc".equalsIgnoreCase(parts[1]) ? "DESC" : "ASC";

        return field + " " + direction;
    }

    private long getTotalCount(String tableName, String whereClause, Map<String, Object> parameters) {
        StringBuilder countQuery = new StringBuilder("SELECT COUNT(*) FROM ");
        countQuery.append(tableName).append(" e");

        if (StringUtils.hasText(whereClause)) {
            countQuery.append(" WHERE ").append(whereClause);
        }

        // Log count SQL for debugging
        log.info("Count SQL: {}", countQuery.toString());
        log.info("Count parameters: {}", parameters);

        Query query = entityManager.createNativeQuery(countQuery.toString());
        parameters.forEach(query::setParameter);

        return ((Number) query.getSingleResult()).longValue();
    }

    private <T> String getTableName(Class<T> viewClass) {
        // Try to get the view name from @Subselect annotation
        Subselect subselect = viewClass.getAnnotation(Subselect.class);
        if (subselect != null) {
            String query = subselect.value();
            // Extract table/view name from "SELECT * FROM view_name" pattern
            if (query.toLowerCase().contains("from ")) {
                String[] parts = query.toLowerCase().split("from ");
                if (parts.length > 1) {
                    String tablePart = parts[1].trim();
                    // Get the first word after FROM (the table/view name)
                    String viewName = tablePart.split("\\s+")[0];
                    return viewName;
                }
            }
        }

        // Fallback: convert class name to snake_case view name
        // QuizCategoryView -> quiz_category_view
        String className = viewClass.getSimpleName();
        if (className.endsWith("View")) {
            className = className.substring(0, className.length() - 4);
        }

        return convertToSnakeCase(className) + "_view";
    }

    private String convertToSnakeCase(String camelCase) {
        return camelCase.replaceAll("([a-z])([A-Z])", "$1_$2").toLowerCase();
    }

    private List<Map<String, Object>> convertToMapList(List<Object[]> resultList, String[] columnNames) {
        return resultList.stream()
                .map(row -> {
                    Map<String, Object> map = new HashMap<>();
                    for (int i = 0; i < columnNames.length && i < row.length; i++) {
                        map.put(columnNames[i], row[i]);
                    }
                    return map;
                })
                .collect(Collectors.toList());
    }
}
