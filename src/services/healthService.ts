import apiClient from './apiService';

export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  services: {
    api: {
      status: 'healthy' | 'unhealthy';
    };
    jwt: {
      status: 'healthy' | 'unhealthy';
      hasToken: boolean;
    };
    frontend: {
      status: 'healthy';
      version: string;
      environment: string;
    };
  };
  uptime: number;
  version: string;
  environment?: {
    mode: string;
  };
}

class HealthService {
  private startTime = Date.now();
  private version = '2.0.0';

  async getHealthStatus(): Promise<HealthStatus> {
    const healthStatus: HealthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        api: { status: 'unhealthy' },
        jwt: { status: 'unhealthy', hasToken: false },
        frontend: {
          status: 'healthy',
          version: this.version,
          environment: import.meta.env.MODE || 'development'
        }
      },
      uptime: Date.now() - this.startTime,
      version: this.version,
      environment: {
        mode: import.meta.env.MODE || 'development'
      }
    };

    // Test API connectivity
    try {
      const response = await apiClient.get('/health');
      healthStatus.services.api = {
        status: 'healthy'
      };
    } catch (error: any) {
      healthStatus.services.api = {
        status: 'unhealthy'
      };
      healthStatus.status = 'degraded';
    }

    // Test JWT token status
    try {
      const token = localStorage.getItem('jwt_token');
      const tokenExpiry = localStorage.getItem('jwt_token_expiry');
      
      if (token && tokenExpiry) {
        const expiryTime = parseInt(tokenExpiry);
        const now = Date.now();
        
        if (now < expiryTime) {
          healthStatus.services.jwt = {
            status: 'healthy',
            hasToken: true
          };
        } else {
          healthStatus.services.jwt = {
            status: 'unhealthy',
            hasToken: true
          };
          healthStatus.status = 'degraded';
        }
      } else {
        healthStatus.services.jwt = {
          status: 'unhealthy',
          hasToken: false
        };
        healthStatus.status = 'degraded';
      }
    } catch (error: any) {
      healthStatus.services.jwt = {
        status: 'unhealthy',
        hasToken: false
      };
      healthStatus.status = 'degraded';
    }

    // Determine overall status
    if (healthStatus.services.api.status === 'unhealthy') {
      healthStatus.status = 'unhealthy';
    }

    return healthStatus;
  }

  async getDetailedHealth(): Promise<any> {
    const health = await this.getHealthStatus();
    
    // Add additional system information
    const detailedHealth = {
      ...health,
      system: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        memory: (performance as any).memory ? {
          used: (performance as any).memory.usedJSHeapSize,
          total: (performance as any).memory.totalJSHeapSize,
          limit: (performance as any).memory.jsHeapSizeLimit
        } : null
      },
      environment: {
        mode: import.meta.env.MODE,
        apiUrl: import.meta.env.VITE_API_TEXT_URL,
        audioUrl: import.meta.env.VITE_API_AUDIO_URL,
        server: import.meta.env.VITE_SERVER,
        port: import.meta.env.VITE_PORT
      }
    };

    return detailedHealth;
  }

  // Health check endpoint for external monitoring
  async ping(): Promise<{ status: string; timestamp: string }> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString()
    };
  }
}

export const healthService = new HealthService();
