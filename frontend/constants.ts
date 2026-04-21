
export enum FaultCategory {
  PowerOutage = 'Power Outage',
  LineDamage = 'Line Damage',
  TransformerFault = 'Transformer Fault',
  MeterIssue = 'Meter Issue',
  VoltageFluctuation = 'Voltage Fluctuation',
  StreetLight = 'Street Light',
  SubstationIssue = 'Substation Issue',
  Other = 'Other',
}

export enum UserRole {
  Admin = 'Admin',
  Technician = 'Technician',
  Customer = 'Customer',
}

export enum FaultStatus {
  Reported = 'Reported',
  Assigned = 'Assigned',
  InProgress = 'In Progress',
  Resolved = 'Resolved',
  Closed = 'Closed',
  Rejected = 'Rejected',
}

export enum Priority {
  Critical = 'Critical',
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
}

export enum LoadSheddingStatus {
  Scheduled = 'Scheduled',
  Active = 'Active',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
}

export enum Area {
  Avenues = 'Avenues',
  Greenside = 'Greenside',
  Sakubva = 'Sakubva',
  Dangamvura = 'Dangamvura',
  Chikanga = 'Chikanga',
  Hobhouse = 'Hobhouse',
  Murambi = 'Murambi',
  Yeovil = 'Yeovil',
}
