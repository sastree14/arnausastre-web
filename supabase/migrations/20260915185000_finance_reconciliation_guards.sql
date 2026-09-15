create unique index if not exists finance_payments_bank_tx_unique
  on public.finance_payments(tenant_id, bank_transaction_id)
  where coalesce(bank_transaction_id,'') <> '';

create unique index if not exists finance_reconciliation_entity_unique
  on public.finance_reconciliations(tenant_id, bank_transaction_id, entity_type, entity_id);
