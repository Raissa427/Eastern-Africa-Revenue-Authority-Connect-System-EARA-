package com.earacg.earaconnect.repository;

import com.earacg.earaconnect.model.Meeting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MeetingRepo extends JpaRepository<Meeting, Long> {
    List<Meeting> findByCreatedById(Long createdById);
    List<Meeting> findByHostingCountryId(Long countryId);
    List<Meeting> findByMeetingType(Meeting.MeetingType meetingType);
    List<Meeting> findByStatus(Meeting.MeetingStatus status);
    List<Meeting> findByMeetingDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    List<Meeting> findByCreatedByIdAndStatus(Long createdById, Meeting.MeetingStatus status);
} 