package com.example.quiz.repository.user;

import com.example.quiz.base.baseInterface.BaseRepository;
import com.example.quiz.model.entity.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends BaseRepository<User, Long> {
    User save(User user);

    void delete(User user);

    boolean existsByUsername(String username);

    boolean existsById(Long id);

    boolean existsByEmail(String email);

    @Query("""
            SELECT COUNT(u) FROM User u
            """)
    int countAll();

    Optional<User> findById(long id);

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String username);

    Optional<User> findByPhone(String phoneNumber);
    
    Optional<User> findByResetPasswordToken(String token);
    
    Optional<User> findByGoogleId(String googleId);

    void deleteById(Long id);

    // Find User's friends
    @Query(value = """
            SELECT DISTINCT u.* 
            FROM users u
            JOIN friendships f ON (f.requester_id = u.id OR f.request_receiver_id = u.id)
            WHERE f.status = 'ACCEPTED'
            AND u.id != :userId
            """, nativeQuery = true)
    Page<User> findFriends(@Param("userId") Long userId, Pageable pageable);

    boolean existsByPhone(String phone);

    @Query(value = "SELECT * FROM users u WHERE u.refresh_token = :token AND (u.email = :emailUsernamePhone OR u.username = :emailUsernamePhone OR u.phone = :emailUsernamePhone)", nativeQuery = true)
    Optional<User> findByRefreshTokenAndEmailOrUsernameOrPhone(@Param("token") String token,
                                                               @Param("emailUsernamePhone") String emailUsernamePhone);

    @Query("select u from User u where u.username like %:query% or u.email like %:query%")
    public List<User> searchUser(@Param("query") String query);

    @Query(
            value = "SELECT DATE_FORMAT(u.created_at, '%Y-%m') AS month, COUNT(*) AS count " +
                    "FROM users u " +
                    "GROUP BY DATE_FORMAT(u.created_at, '%Y-%m')",
            nativeQuery = true
    )
    List<Object[]> countUsersPerMonth();
}
