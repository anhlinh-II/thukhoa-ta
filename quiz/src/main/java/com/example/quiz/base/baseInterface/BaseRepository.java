package com.example.quiz.base.baseInterface;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;

@NoRepositoryBean
public interface BaseRepository<T, ID> extends JpaRepository<T, ID> {

	// Derived-query helpers for hierarchical entities that have a 'parentId' property.
	// Concrete repositories will get implementations via Spring Data query derivation when the entity contains 'parentId'.
	java.util.List<T> findAllByParentId(Object parentId);

	java.util.List<T> findAllByParentIdIsNull();

}
