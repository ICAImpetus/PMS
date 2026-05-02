// NOTE:
// Hospital validation is now enforced on the backend via
// `backend/models/HospitalModel.js`. To avoid the frontend
// being the source of truth for the schema, this Yup schema
// has been intentionally commented out.
//
// If you still want client-side validation, you can either:
// 1) Re‑enable this file, or
// 2) Fetch validation rules dynamically from the backend.
//
// import * as Yup from 'yup';
//
// export const validationSchema = Yup.object({ ... });

