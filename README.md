
# Replica Fiverr

Refactory from : https://fiverrnew.cybersoft.edu.vn/swagger/index.html
Link Local : http://localhost:8080/swagger/



## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

```bash
DATABASE_URL="mysql://root:123456@localhost:3306/replica-fiverr"

SECRECT_KEY="MY-SECRECT-KEY"
SECRECT_KEY_REFRESH="MY-SECRECT-REFESH-KEY"

EXPIRES_IN="1h"
REFRESH_EXPIRES_IN="7d"

LENGTH_KEY_PAIR="3"

PATH_PUBLIC_IMAGE_UPLOAD="/img/gigs"
PATH_PUBLIC_IMAGE_AVATAR="/img/avatar"
PATH_IMAGE_PUBLIC_CATEGORIES="/img/sub-categories"
```


## Dev

To run dev this project run

```bash
  yarn start:dev
```

Prisma connect db 
```base
  database name : replica-fiverr
```

To fix error with sharp npm

```bash
  yarn add sharp --ignore-engines
```

## Explain Guard

We have 2 roles :
- ADMIN
- USER 

For check Owner post before give access to post, put, delete
```bash
@ApiBearerAuth("access-token")
@UseGuards(JwtGuard, OwnerGuard)
@ResourceInfo({
  table: "certification",
  field: "user_id"
})
@ApiOperation({ summary: "Need OWNER to access" })
@Delete("/certifications/:resourceId(\\d+)")
```
- with Param resourceId will be used to get item with id = resourceId and check OWNER.

For check Role, if role ADMIN 
```bash
@ApiBearerAuth("access-token")
@UseGuards(JwtGuard, RoleGuard)
@Roles(ROLE_LEVEL.ADMIN)
@ApiOperation({ summary: "Need permission Admin to gain role for other user" })
@Put("/assign-role")
```
- If user has role in list roles in decorator @Roles, then have access to do.

For check whether OWNER or ADMIN to access data
```base
@ApiBearerAuth("access-token")
@ApiOperation({ summary: "Need permission Owner or admin to access" })
@UseGuards(JwtGuard, CompositeGuardMixin())
@CompositeGuardDecorator(OwnerGuard, RoleGuard)
@Roles(ROLE_LEVEL.ADMIN)
@ResourceInfo({
  table: "gig_booking",
  field: "renter_id"
})
@Delete("/:resourceId(\\d+)")
```
- We use custom guard mixin name `CompositeGuardMixin`, with input is OWNER guard & ROLE guard, if one guard success then good to go.

