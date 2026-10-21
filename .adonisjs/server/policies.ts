export const policies = {
  CustomerAddressPolicy: () => import('#policies/customer_address_policy'),
  OrderPolicy: () => import('#policies/order_policy'),
  OtpFlowPolicy: () => import('#policies/otp_flow_policy'),
}

