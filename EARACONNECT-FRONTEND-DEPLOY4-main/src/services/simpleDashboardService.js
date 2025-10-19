import { API_BASE } from './apiConfig';

class SimpleDashboardService {
  // Fetch simple performance data for dashboard
  static async getSimplePerformanceData() {
    try {
      const response = await fetch(`${API_BASE}/dashboard/performance/simple`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }

  // Fetch countries list
  static async getCountries() {
    try {
      const response = await fetch(`${API_BASE}/countries`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching countries:', error);
      throw error;
    }
  }

  // Fetch reports summary by country
  static async getReportsSummary() {
    try {
      const response = await fetch(`${API_BASE}/reports/summary`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching reports summary:', error);
      throw error;
    }
  }

  // Fetch assigned resolutions summary by country
  static async getResolutionsSummary() {
    try {
      const response = await fetch(`${API_BASE}/resolutions/summary`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching resolutions summary:', error);
      throw error;
    }
  }
}

export default SimpleDashboardService;
