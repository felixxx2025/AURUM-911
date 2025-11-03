# Modelos SQL (iniciais)

Observação: todas as tabelas possuem `tenant_id UUID` para isolamento lógico.

```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  cnpj TEXT,
  plan TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE employees (
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

CREATE TABLE payroll_runs (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  period_start DATE,
  period_end DATE,
  status TEXT, -- draft | simulated | approved | paid
  totals JSONB,
  created_by UUID,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE time_punches (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  employee_id UUID REFERENCES employees(id),
  ts TIMESTAMP,
  type TEXT, -- in | out | break_start | break_end
  location JSONB,
  bio_proof JSONB,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE partners (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  name TEXT,
  slug TEXT,
  type TEXT, -- payment | consig | benefits | insurer
  config JSONB,
  status TEXT,
  created_at TIMESTAMP DEFAULT now()
);
```
