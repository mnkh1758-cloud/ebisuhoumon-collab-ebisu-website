# Smart Ledger 1 - SaaS Multi-tenant Architecture

## 1. Data Structure
All data must be isolated by `clinicId`. The following path structure is enforced:

- **Clinic Settings**: `clinics/{clinicId}/settings/general`
- **Reservations**: `clinics/{clinicId}/reservations/{reservationId}`
- **Patients**: `clinics/{clinicId}/patients/{patientId}`
- **Medical Records**: `clinics/{clinicId}/medicalRecords/{recordId}` (Flat structure for cross-patient querying)
- **Staff**: `clinics/{clinicId}/staff/{staffId}`
- **Questionnaires**: `clinics/{clinicId}/questionnaires/{questionnaireId}`

## 2. User Roles
- **Administrator (院長)**: Full access to clinic data and settings.
- **Staff (スタッフ)**: Access to clinical data (reservations, patients, records) but restricted from clinic-wide settings.

## 3. Implementation Rules
- Always use `clinicId` from the context/URL.
- Never perform queries without a `clinicId` filter.
- Medical records now include `patientDocId` to maintain the relationship in the flat structure.

## 4. Security (Planned)
Firebase Security Rules will enforce:
- `allow read, write: if request.auth.uid != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.clinicId == clinicId`
