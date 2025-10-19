const API_BASE = process.env.REACT_APP_BASE_URL || 'http://localhost:8081/api';

export class EARADashboardService {
  // Fetch performance metrics from reports and assigned resolutions
  static async getPerformanceMetrics(country = 'all', committee = 'all', timeFilter = 'month') {
    try {
      const response = await fetch(`${API_BASE}/dashboard/performance-metrics?country=${country}&committee=${committee}&time=${timeFilter}`);
      if (!response.ok) throw new Error('Failed to fetch performance metrics');
      return await response.json();
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      throw error;
    }
  }

  // Fetch country performance data from reports table
  static async getCountryPerformance(country = 'all', committee = 'all', timeFilter = 'month') {
    try {
      const response = await fetch(`${API_BASE}/dashboard/country-performance?country=${country}&committee=${committee}&time=${timeFilter}`);
      if (!response.ok) throw new Error('Failed to fetch country performance');
      return await response.json();
    } catch (error) {
      console.error('Error fetching country performance:', error);
      throw error;
    }
  }

  // Fetch resolution status distribution from assigned resolutions table
  static async getResolutionStatus(country = 'all', committee = 'all', timeFilter = 'month') {
    try {
      const response = await fetch(`${API_BASE}/dashboard/resolution-status?country=${country}&committee=${committee}&time=${timeFilter}`);
      if (!response.ok) throw new Error('Failed to fetch resolution status');
      return await response.json();
    } catch (error) {
      console.error('Error fetching resolution status:', error);
      throw error;
    }
  }

  // Fetch monthly trends from reports and resolutions
  static async getMonthlyTrends(country = 'all', committee = 'all', timeFilter = 'month') {
    try {
      const response = await fetch(`${API_BASE}/dashboard/monthly-trends?country=${country}&committee=${committee}&time=${timeFilter}`);
      if (!response.ok) throw new Error('Failed to fetch monthly trends');
      return await response.json();
    } catch (error) {
      console.error('Error fetching monthly trends:', error);
      throw error;
    }
  }

  // Fetch task assignments from assigned resolutions table
  static async getTaskAssignments(country = 'all', committee = 'all', timeFilter = 'month') {
    try {
      const response = await fetch(`${API_BASE}/dashboard/task-assignments?country=${country}&committee=${committee}&time=${timeFilter}`);
      if (!response.ok) throw new Error('Failed to fetch task assignments');
      return await response.json();
    } catch (error) {
      console.error('Error fetching task assignments:', error);
      throw error;
    }
  }

  // Fetch Gantt chart data from reports and assigned resolutions
  static async getGanttData(country = 'all', committee = 'all', timeFilter = 'month') {
    try {
      const response = await fetch(`${API_BASE}/dashboard/gantt-data?country=${country}&committee=${committee}&time=${timeFilter}`);
      if (!response.ok) throw new Error('Failed to fetch Gantt data');
      return await response.json();
    } catch (error) {
      console.error('Error fetching Gantt data:', error);
      throw error;
    }
  }

  // Fetch comprehensive dashboard data
  static async getComprehensiveDashboardData(country = 'all', committee = 'all', timeFilter = 'month') {
    try {
      const [
        performanceMetrics,
        countryPerformance,
        resolutionStatus,
        monthlyTrends,
        taskAssignments,
        ganttData
      ] = await Promise.all([
        this.getPerformanceMetrics(country, committee, timeFilter),
        this.getCountryPerformance(country, committee, timeFilter),
        this.getResolutionStatus(country, committee, timeFilter),
        this.getMonthlyTrends(country, committee, timeFilter),
        this.getTaskAssignments(country, committee, timeFilter),
        this.getGanttData(country, committee, timeFilter)
      ]);

      return {
        performanceMetrics,
        countryPerformance,
        resolutionStatus,
        monthlyTrends,
        taskAssignments,
        ganttData
      };
    } catch (error) {
      console.error('Error fetching comprehensive dashboard data:', error);
      throw error;
    }
  }

  // Get available countries from database
  static async getAvailableCountries() {
    try {
      const response = await fetch(`${API_BASE}/dashboard/countries`);
      if (!response.ok) throw new Error('Failed to fetch countries');
      return await response.json();
    } catch (error) {
      console.error('Error fetching countries:', error);
      throw error;
    }
  }

  // Get available committees from database
  static async getAvailableCommittees() {
    try {
      const response = await fetch(`${API_BASE}/dashboard/committees`);
      if (!response.ok) throw new Error('Failed to fetch committees');
      return await response.json();
    } catch (error) {
      console.error('Error fetching committees:', error);
      throw error;
    }
  }

  // Export dashboard data
  static async exportDashboardData(format = 'csv', country = 'all', committee = 'all', timeFilter = 'month') {
    try {
      const response = await fetch(`${API_BASE}/dashboard/export?format=${format}&country=${country}&committee=${committee}&time=${timeFilter}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) throw new Error('Failed to export dashboard data');
      
      if (format === 'csv') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `eara-dashboard-${country}-${committee}-${timeFilter}.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        return await response.json();
      }
    } catch (error) {
      console.error('Error exporting dashboard data:', error);
      throw error;
    }
  }

  // Generate performance recommendations based on data
  static generateRecommendations(metrics) {
    const recommendations = [];

    if (metrics.approvalRate < 80) {
      recommendations.push({
        type: 'warning',
        title: 'Low Approval Rate',
        description: 'Consider reviewing approval processes and providing additional training to committee members.',
        priority: 'high'
      });
    }

    if (metrics.taskCompletion < 70) {
      recommendations.push({
        type: 'warning',
        title: 'Low Task Completion',
        description: 'Review task assignment processes and consider redistributing workload.',
        priority: 'medium'
      });
    }

    if (metrics.averageResolutionTime > 20) {
      recommendations.push({
        type: 'info',
        title: 'High Resolution Time',
        description: 'Implement streamlined processes to reduce resolution time.',
        priority: 'medium'
      });
    }

    if (metrics.memberParticipation < 85) {
      recommendations.push({
        type: 'warning',
        title: 'Low Member Participation',
        description: 'Encourage member engagement through incentives and better communication.',
        priority: 'low'
      });
    }

    return recommendations;
  }
}

export default EARADashboardService;
