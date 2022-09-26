# dockSeek-backend

## Auth

```
  /auth/signup    : signup user
  /auth/login     : login user
  /auth/token     : genrate new access token
  /auth/reqreset  : request link for pass reset
  /auth/resetpass : reset password
  
```

## Doctor

```

 /doctor/new               : add doc's details
 /doctor/                  : get all docs
 /doctor/:docId            : get doc by docId
 /doctor/:docid/bookslot   : update doctor's timeslot
 /doctor/:docId/edit       : edit doctor profile
 /doctor/:docId/addratings : add ratings to doctor
 
```

## Patient

```
 /patient/new         :add patient details
 /patient/:patId      :get patient details
 /patient/:patId/edit :edit patient profile
 
```

## Appointments

```
 /appointments/new                    : book new appointment
 /appointmets/                        : get all apo\pointments
 /appointments/id/update              : update status of appoinment
 /appointments/:appointmentId/addnote : add note to appointment
 /appointments/:id/addratings         : add ratings given by patient in appointment
 
```
