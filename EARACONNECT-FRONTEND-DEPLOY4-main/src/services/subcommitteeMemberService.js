// services/subcommitteeMemberService.js
import { API_BASE } from './apiConfig';

export class SubcommitteeMemberService {
  
  /**
   * Get all members for a specific subcommittee
   */
  static async getSubcommitteeMembers(subcommitteeId) {
    try {
      console.log(`🔍 SubcommitteeMemberService: Fetching members for subcommittee ID ${subcommitteeId}`);
      const response = await fetch(`${API_BASE}/country-committee-members/sub-committee/${subcommitteeId}`);
      console.log(`🔍 SubcommitteeMemberService: Response status for subcommittee ${subcommitteeId}:`, response.status);
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log(`⚠️ SubcommitteeMemberService: No members found for subcommittee ${subcommitteeId}`);
          return []; // No members found
        }
        throw new Error(`Failed to fetch subcommittee members: ${response.status}`);
      }
      
      const members = await response.json();
      const memberArray = Array.isArray(members) ? members : [];
      console.log(`✅ SubcommitteeMemberService: Found ${memberArray.length} members for subcommittee ${subcommitteeId}:`, memberArray);
      return memberArray;
    } catch (error) {
      console.error(`❌ SubcommitteeMemberService: Error fetching members for subcommittee ${subcommitteeId}:`, error);
      return [];
    }
  }

  /**
   * Get member count for a specific subcommittee
   */
  static async getSubcommitteeMemberCount(subcommitteeId) {
    try {
      console.log(`🔍 SubcommitteeMemberService: Getting member count for subcommittee ID ${subcommitteeId}`);
      const members = await this.getSubcommitteeMembers(subcommitteeId);
      const count = members.length;
      console.log(`✅ SubcommitteeMemberService: Subcommittee ${subcommitteeId} has ${count} members`);
      return count;
    } catch (error) {
      console.error(`❌ SubcommitteeMemberService: Error getting member count for subcommittee ${subcommitteeId}:`, error);
      return 0;
    }
  }

  /**
   * Get member counts for multiple subcommittees
   */
  static async getSubcommitteesMemberCounts(subcommittees) {
    try {
      console.log('🔍 SubcommitteeMemberService: Getting member counts for', subcommittees.length, 'subcommittees');
      
      const subcommitteesWithCounts = await Promise.all(
        subcommittees.map(async (subcommittee) => {
          console.log(`🔍 SubcommitteeMemberService: Fetching members for ${subcommittee.name} (ID: ${subcommittee.id})`);
          const memberCount = await this.getSubcommitteeMemberCount(subcommittee.id);
          console.log(`✅ SubcommitteeMemberService: ${subcommittee.name} has ${memberCount} members`);
          return {
            ...subcommittee,
            memberCount
          };
        })
      );
      
      console.log('✅ SubcommitteeMemberService: All subcommittees with counts:', subcommitteesWithCounts);
      return subcommitteesWithCounts;
    } catch (error) {
      console.error('❌ SubcommitteeMemberService: Error fetching subcommittee member counts:', error);
      return subcommittees.map(sub => ({ ...sub, memberCount: 0 }));
    }
  }

  /**
   * Get all subcommittees with their member counts
   */
  static async getAllSubcommitteesWithMembers() {
    try {
      console.log('🔍 SubcommitteeMemberService: Starting to fetch subcommittees...');
      
      // Use the new backend endpoint that provides subcommittees with member counts
      const subcommitteesResponse = await fetch(`${API_BASE}/country-committee-members/subcommittees/with-counts`);
      console.log('🔍 SubcommitteeMemberService: Response status:', subcommitteesResponse.status);
      
      if (!subcommitteesResponse.ok) {
        console.error('❌ SubcommitteeMemberService: Failed to fetch subcommittees with member counts. Status:', subcommitteesResponse.status);
        throw new Error('Failed to fetch subcommittees with member counts');
      }
      
      const subcommittees = await subcommitteesResponse.json();
      console.log('✅ SubcommitteeMemberService: Fetched subcommittees with member counts:', subcommittees);
      return subcommittees;
    } catch (error) {
      console.error('❌ SubcommitteeMemberService: Error fetching subcommittees with members:', error);
      
      // Fallback: try to get subcommittees and calculate member counts manually
      try {
        console.log('🔄 SubcommitteeMemberService: Trying fallback method...');
        const [subcommitteesResponse, allMembersResponse] = await Promise.all([
          fetch(`${API_BASE}/sub-committees`),
          fetch(`${API_BASE}/country-committee-members/all`)
        ]);
        
        console.log('🔍 SubcommitteeMemberService: Fallback responses - Subcommittees:', subcommitteesResponse.status, 'Members:', allMembersResponse.status);
        
        if (subcommitteesResponse.ok && allMembersResponse.ok) {
          const subcommittees = await subcommitteesResponse.json();
          const allMembers = await allMembersResponse.json();
          
          console.log('🔍 SubcommitteeMemberService: Fallback data - Subcommittees:', subcommittees.length, 'Members:', allMembers.length);
          
          const subcommitteesWithCounts = await Promise.all(
            subcommittees.map(async (subcommittee) => {
              const memberCount = await this.getSubcommitteeMemberCount(subcommittee.id);
              return {
                ...subcommittee,
                memberCount
              };
            })
          );
          
          console.log('🔄 SubcommitteeMemberService: Using fallback method, subcommittees with counts:', subcommitteesWithCounts);
          return subcommitteesWithCounts;
        }
      } catch (fallbackError) {
        console.error('❌ SubcommitteeMemberService: Fallback method also failed:', fallbackError);
      }
      
      // Return fallback data with real member counts if possible
      const fallbackSubcommittees = [
        { id: 1, name: "Head Of Delegation", memberCount: 0 },
        { id: 2, name: "Domestic Revenue Sub Committee", memberCount: 0 },
        { id: 3, name: "Customs Revenue Sub Committee", memberCount: 0 },
        { id: 4, name: "IT Sub Committee", memberCount: 0 },
        { id: 5, name: "Legal Sub Committee", memberCount: 0 },
        { id: 6, name: "HR Sub Committee", memberCount: 0 },
        { id: 7, name: "Research Sub Committee", memberCount: 0 }
      ];
      
      console.log('🔄 SubcommitteeMemberService: Using hardcoded fallback result:', fallbackSubcommittees);
      return fallbackSubcommittees;
    }
  }
}

export default SubcommitteeMemberService;
