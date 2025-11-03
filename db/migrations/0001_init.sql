-- Initial schema for AURUM HR+
-- Tenants
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  cnpj TEXT,
  plan TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Employees
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  employee_number TEXT,
  first_name TEXT,
  last_name TEXT,
  cpf TEXT,
  email TEXT,
  phone TEXT,
  role TEXT,
  department TEXT,
  hire_date DATE,
  termination_date DATE,
  status TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT now()
);

-- Payroll runs
CREATE TABLE IF NOT EXISTS payroll_runs (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  period_start DATE,
  period_end DATE,
  status TEXT,
  totals JSONB,
  created_by UUID,
  created_at TIMESTAMP DEFAULT now()
);

-- Time punches
CREATE TABLE IF NOT EXISTS time_punches (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  employee_id UUID REFERENCES employees(id),
  ts TIMESTAMP,
  type TEXT,
  location JSONB,
  bio_proof JSONB,
  created_at TIMESTAMP DEFAULT now()
);

-- Partners
CREATE TABLE IF NOT EXISTS partners (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  name TEXT,
  slug TEXT,
  type TEXT,
  config JSONB,
  status TEXT,
  created_at TIMESTAMP DEFAULT now()
);
