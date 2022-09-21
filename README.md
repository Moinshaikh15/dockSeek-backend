# dockSeek-backend

## Auth

```
  /auth/signup : signup user
  /auth/login  : login user
  /auth/token  : genrate new access token
  /auth/reqreset: request link for pass reset
  /auth/resetpass : reset password
```

## Doctor

```
 /doctor/new           : add doc's details
 /doctor/              : get all docs
 /doctor/:docId        : get doc by docId
 /doctor/:docId/update : update doctor's timeslot
```

## patient

```
 /patient/new :add patient details
 /patient/:patId: get patient details
```

## appointments

```
 /appointments/new       : book new appointment
 /appointmets/           : get all apo\pointments
 /appointments/id/update : update status of appoinment
```
