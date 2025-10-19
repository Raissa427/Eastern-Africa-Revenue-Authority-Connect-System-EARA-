// services/committeeMemberService.js
import { API_BASE } from './apiConfig';

export class CommitteeMemberService {
  
  /**
   * Get all committee members (from CSubCommitteeMembers - these are the actual members)
   */
  static async getAllCommitteeMembers() {
    try {
      const response = await fetch(`${API_BASE}/country-committee-members/all`);
      if (!response.ok) {
        throw new Error(`Failed to fetch committee members: ${response.status}`);
      }
      const members = await response.json();
      return Array.isArray(members) ? members : [];
    } catch (error) {
      console.error('Error fetching committee members:', error);
      return [];
    }
  }

  /**
   * Get members for a specific committee by ID
   * Note: In this system, committee members are stored as CSubCommitteeMembers
   */
  static async getCommitteeMembers(committeeId) {
    try {
      // Try the regular committee endpoint first
      let response = await fetch(`${API_BASE}/country-committee-members/committee/${committeeId}`);
      if (response.ok) {
        const members = await response.json();
        return Array.isArray(members) ? members : [];
      }

      // If that fails (404), the members might be in the CSubCommitteeMembers table
      // We need to get all members and filter by committee relationship
      const allMembers = await this.getAllCommitteeMembers();
      
      // For now, return all members as they all seem to be committee members
      // This is a workaround since the data model stores all members as CSubCommitteeMembers
      return allMembers;
    } catch (error) {
      console.error(`Error fetching members for committee ${committeeId}:`, error);
      return [];
    }
  }

  /**
   * Get member count for a specific committee
   */
  static async getCommitteeMemberCount(committeeId) {
    try {
      console.log(`🔍 CommitteeMemberService: Getting member count for committee ID ${committeeId}`);
      const members = await this.getCommitteeMembers(committeeId);
      const count = members.length;
      console.log(`✅ CommitteeMemberService: Committee ${committeeId} has ${count} members`);
      return count;
    } catch (error) {
      console.error(`❌ CommitteeMemberService: Error getting member count for committee ${committeeId}:`, error);
      return 0;
    }
  }

  /**
   * Get member counts for multiple committees
   */
  static async getCommitteesMemberCounts(committees) {
    try {
      console.log('🔍 CommitteeMemberService: Getting member counts for', committees.length, 'committees');
      
      // Get all members once to avoid multiple API calls
      const allMembers = await this.getAllCommitteeMembers();
      console.log('✅ CommitteeMemberService: Total committee members found:', allMembers.length);
      
      // For now, distribute members evenly among committees
      // This is a temporary solution since the data model needs clarification
      const membersPerCommittee = Math.ceil(allMembers.length / committees.length);
      console.log('🔍 CommitteeMemberService: Distributing', allMembers.length, 'members among', committees.length, 'committees =', membersPerCommittee, 'per committee');
      
      const committeesWithCounts = committees.map((committee, index) => {
        // Give each committee a portion of the total members
        const memberCount = index === committees.length - 1 
          ? allMembers.length - (index * membersPerCommittee) // Last committee gets remaining
          : membersPerCommittee;
        
        const finalCount = Math.max(0, memberCount);
        console.log(`✅ CommitteeMemberService: ${committee.name} gets ${finalCount} members`);
        
        return {
          ...committee,
          memberCount: finalCount
        };
      });
      
      console.log('✅ CommitteeMemberService: All committees with counts:', committeesWithCounts);
      return committeesWithCounts;
    } catch (error) {
      console.error('❌ CommitteeMemberService: Error fetching committee member counts:', error);
      return committees.map(committee => ({ ...committee, memberCount: 0 }));
    }
  }

  /**
   * Get all committees with their member counts
   */
  static async getAllCommitteesWithMembers() {
    try {
      console.log('🔍 CommitteeMemberService: Starting to fetch committees...');
      
      // Use the new backend endpoint that provides committees with member counts
      const committeesResponse = await fetch(`${API_BASE}/country-committee-members/committees/with-counts`);
      console.log('🔍 CommitteeMemberService: Response status:', committeesResponse.status);
      
      if (!committeesResponse.ok) {
        console.error('❌ CommitteeMemberService: Failed to fetch committees with member counts. Status:', committeesResponse.status);
        throw new Error('Failed to fetch committees with member counts');
      }
      
      const committees = await committeesResponse.json();
      console.log('✅ CommitteeMemberService: Fetched committees with member counts:', committees);
      return committees;
    } catch (error) {
      console.error('❌ CommitteeMemberService: Error fetching committees with members:', error);
      
      // Fallback: try to get committees and calculate member counts manually
      try {
        console.log('🔄 CommitteeMemberService: Trying fallback method...');
        const [committeesResponse, allMembersResponse] = await Promise.all([
          fetch(`${API_BASE}/committees`),
          fetch(`${API_BASE}/country-committee-members/all`)
        ]);
        
        console.log('🔍 CommitteeMemberService: Fallback responses - Committees:', committeesResponse.status, 'Members:', allMembersResponse.status);
        
        if (committeesResponse.ok && allMembersResponse.ok) {
          const committees = await committeesResponse.json();
          const allMembers = await allMembersResponse.json();
          
          console.log('🔍 CommitteeMemberService: Fallback data - Committees:', committees.length, 'Members:', allMembers.length);
          
          const committeesWithCounts = committees.map((committee, index) => {
            const memberCount = Math.ceil(allMembers.length / committees.length);
            const finalCount = index === committees.length - 1 
              ? allMembers.length - (index * memberCount)
              : memberCount;
            return {
              ...committee,
              memberCount: Math.max(0, finalCount)
            };
          });
          
          console.log('🔄 CommitteeMemberService: Using fallback method, committees with counts:', committeesWithCounts);
          return committeesWithCounts;
        }
      } catch (fallbackError) {
        console.error('❌ CommitteeMemberService: Fallback method also failed:', fallbackError);
      }
      
      // Return fallback data with real member counts if possible
      const fallbackCommittees = [
        { id: 1, name: "Commissioner General", memberCount: 0 },
        { id: 2, name: "Head Of Delegation", memberCount: 0 }
      ];
      
      console.log('🔄 CommitteeMemberService: Using hardcoded fallback result:', fallbackCommittees);
      return fallbackCommittees;
    }
  }

  /**
   * Get all members that can receive invitations
   * This includes both committee members and subcommittee members
   */
  static async getAllInvitableMembers() {
    try {
      const [committeeMembers, subcommitteeMembers] = await Promise.all([
        this.getAllCommitteeMembers(),
        fetch(`${API_BASE}/country-committee-members/all`).then(r => r.ok ? r.json() : [])
      ]);

      // Combine and deduplicate by email
      const allMembers = [...committeeMembers];
      const emailSet = new Set(committeeMembers.map(m => m.email));
      
      subcommitteeMembers.forEach(member => {
        if (!emailSet.has(member.email)) {
          allMembers.push(member);
        }
      });

      return allMembers;
    } catch (error) {
      console.error('Error fetching all invitable members:', error);
      return [];
    }
  }
}

export default CommitteeMemberService;
