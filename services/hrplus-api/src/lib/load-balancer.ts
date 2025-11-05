interface ServiceInstance {
  id: string
  url: string
  healthy: boolean
  weight: number
  currentConnections: number
  responseTime: number
}

export class LoadBalancer {
  private instances: ServiceInstance[] = []
  private currentIndex = 0

  addInstance(instance: Omit<ServiceInstance, 'healthy' | 'currentConnections' | 'responseTime'>) {
    this.instances.push({
      ...instance,
      healthy: true,
      currentConnections: 0,
      responseTime: 0,
    })
  }

  removeInstance(id: string) {
    this.instances = this.instances.filter(i => i.id !== id)
  }

  // Round-robin with health checks
  getNextInstance(): ServiceInstance | null {
    const healthyInstances = this.instances.filter(i => i.healthy)
    
    if (healthyInstances.length === 0) return null
    
    const instance = healthyInstances[this.currentIndex % healthyInstances.length]
    this.currentIndex++
    
    return instance
  }

  // Weighted round-robin
  getWeightedInstance(): ServiceInstance | null {
    const healthyInstances = this.instances.filter(i => i.healthy)
    
    if (healthyInstances.length === 0) return null
    
    const totalWeight = healthyInstances.reduce((sum, i) => sum + i.weight, 0)
    let random = Math.random() * totalWeight
    
    for (const instance of healthyInstances) {
      random -= instance.weight
      if (random <= 0) return instance
    }
    
    return healthyInstances[0]
  }

  // Least connections
  getLeastConnectionsInstance(): ServiceInstance | null {
    const healthyInstances = this.instances.filter(i => i.healthy)
    
    if (healthyInstances.length === 0) return null
    
    return healthyInstances.reduce((min, current) => 
      current.currentConnections < min.currentConnections ? current : min
    )
  }

  markUnhealthy(id: string) {
    const instance = this.instances.find(i => i.id === id)
    if (instance) instance.healthy = false
  }

  markHealthy(id: string) {
    const instance = this.instances.find(i => i.id === id)
    if (instance) instance.healthy = true
  }

  updateMetrics(id: string, metrics: { connections?: number; responseTime?: number }) {
    const instance = this.instances.find(i => i.id === id)
    if (instance) {
      if (metrics.connections !== undefined) {
        instance.currentConnections = metrics.connections
      }
      if (metrics.responseTime !== undefined) {
        instance.responseTime = metrics.responseTime
      }
    }
  }

  getStats() {
    return {
      totalInstances: this.instances.length,
      healthyInstances: this.instances.filter(i => i.healthy).length,
      instances: this.instances.map(i => ({
        id: i.id,
        healthy: i.healthy,
        connections: i.currentConnections,
        responseTime: i.responseTime,
      })),
    }
  }
}

// Global load balancer instance
export const loadBalancer = new LoadBalancer()