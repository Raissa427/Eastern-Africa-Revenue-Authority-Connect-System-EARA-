package com.earacg.earaconnect.repository;

import com.earacg.earaconnect.model.Resolution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ResolutionRepo extends JpaRepository<Resolution, Long> {
    List<Resolution> findByMeetingId(Long meetingId);
    List<Resolution> findByCreatedById(Long createdById);
    List<Resolution> findByStatus(Resolution.ResolutionStatus status);
    List<Resolution> findByMeetingIdAndStatus(Long meetingId, Resolution.ResolutionStatus status);
} 