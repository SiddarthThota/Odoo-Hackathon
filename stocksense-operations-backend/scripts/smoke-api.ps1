$ErrorActionPreference = 'Stop'

$base = 'http://localhost:3001'
$api = "$base/api/v1/operations"

function Invoke-Json {
  param(
    [Parameter(Mandatory=$true)][string]$Method,
    [Parameter(Mandatory=$true)][string]$Uri,
    [object]$Body
  )

  $params = @{
    Uri = $Uri
    Method = $Method
    Headers = @{ 'x-dev-user-id' = 'smoke-user'; 'x-dev-user-role' = 'InventoryManager' }
  }

  if ($null -ne $Body) {
    $params.ContentType = 'application/json'
    $params.Body = ($Body | ConvertTo-Json -Depth 10)
  }

  Invoke-RestMethod @params
}

function Assert-Equal {
  param([object]$Actual, [object]$Expected, [string]$Message)
  if ($Actual -ne $Expected) {
    throw "$Message. Expected '$Expected', got '$Actual'."
  }
}

Write-Host '1. Health check'
$health = Invoke-RestMethod "$base/health"
Assert-Equal $health.status 'ok' 'Health status failed'

Write-Host '2. Create receipt'
$receipt = Invoke-Json POST "$api/receipts" @{
  supplierRef = 'SUP-SMOKE'
  warehouseId = 'WH-001'
  scheduledDate = (Get-Date).ToUniversalTime().ToString('o')
  notes = 'Smoke test receipt'
  lines = @(
    @{
      productId = 'PROD-001'
      expectedQty = 100
      receivedQty = 100
      unitOfMeasure = 'PCS'
    }
  )
}
Assert-Equal $receipt.status 'DRAFT' 'Receipt was not created as DRAFT'

Write-Host '3. Submit receipt -> READY'
$receipt = Invoke-Json POST "$api/receipts/$($receipt.id)/submit"
Assert-Equal $receipt.status 'READY' 'Receipt did not reach READY'

Write-Host '4. Validate receipt -> DONE'
$receipt = Invoke-Json POST "$api/receipts/$($receipt.id)/validate"
Assert-Equal $receipt.status 'DONE' 'Receipt did not reach DONE'

Write-Host '5. Delivery pick -> WAITING -> pack -> READY -> validate -> DONE'
$delivery = Invoke-Json POST "$api/deliveries" @{
  customerRef = 'CUSTOMER-SMOKE'
  warehouseId = 'WH-001'
  scheduledDate = (Get-Date).ToUniversalTime().ToString('o')
  notes = 'Smoke test delivery'
  lines = @(
    @{
      productId = 'PROD-001'
      expectedQty = 10
      deliveredQty = 10
      unitOfMeasure = 'PCS'
    }
  )
}
$delivery = Invoke-Json POST "$api/deliveries/$($delivery.id)/pick"
Assert-Equal $delivery.status 'WAITING' 'Delivery did not reach WAITING after pick'
$delivery = Invoke-Json POST "$api/deliveries/$($delivery.id)/pack"
Assert-Equal $delivery.status 'READY' 'Delivery did not reach READY after pack'
$delivery = Invoke-Json POST "$api/deliveries/$($delivery.id)/validate"
Assert-Equal $delivery.status 'DONE' 'Delivery did not reach DONE'

Write-Host '6. Transfer validate'
$transfer = Invoke-Json POST "$api/transfers" @{
  sourceLocationId = 'LOC-A'
  destinationLocationId = 'LOC-B'
  notes = 'Smoke test transfer'
  lines = @(
    @{
      productId = 'PROD-001'
      quantity = 10
    }
  )
}
$transfer = Invoke-Json POST "$api/transfers/$($transfer.id)/validate"
Assert-Equal $transfer.status 'DONE' 'Transfer did not reach DONE'

Write-Host '7. Adjustment snapshot + apply'
$adjustment = Invoke-Json POST "$api/adjustments" @{
  productId = 'PROD-001'
  locationId = 'LOC-A'
  countedQty = 87
  reason = 'smoke-test'
}
Assert-Equal ([double]$adjustment.recordedQty) 90 'Adjustment did not snapshot expected quantity'
Assert-Equal ([double]$adjustment.delta) -3 'Adjustment delta is incorrect'
$adjustment = Invoke-Json POST "$api/adjustments/$($adjustment.id)/apply"
Assert-Equal $adjustment.status 'DONE' 'Adjustment did not reach DONE'

Write-Host '8. Move History'
$history = Invoke-Json GET "$api/move-history?page=1&limit=25"
Assert-Equal $history.meta.total 4 'Move History should contain four smoke-test entries'

Write-Host '9. Dashboard statistics'
$stats = Invoke-Json GET "$api/stats/summary"
Assert-Equal $stats.pendingReceipts 0 'Pending receipts should be zero'
Assert-Equal $stats.pendingDeliveries 0 'Pending deliveries should be zero'
Assert-Equal $stats.scheduledTransfers 0 'Scheduled transfers should be zero'

Write-Host '10. Route/state safety negative check'
try {
  Invoke-Json POST "$api/receipts/$($receipt.id)/validate" | Out-Null
  throw 'Expected second receipt validation to fail, but it succeeded.'
} catch {
  if ($_.Exception.Message -match 'Expected second receipt validation') { throw }
}

Write-Host ''
Write-Host 'Smoke API run passed.'
