import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable, mixin } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { NAME_DECORATOR_COMPOSITE, TypeCompositeGuardDecorator } from 'src/decorators/composite-guard/composite-guard.decorator';

////EXPLAIN :
/*
THIS GUARD WILL RUN ALL GUARD IN DECORATOR AND RETURN TRUE WHEN ATLEAST ONE GUARD IN ARRAY RETURN TRUE
THIS GUARD CAN BE HELPFUL TO DEAL WITH LOGIC OWNER AND ROLE :
IF OWNER GO TO ROUTE ITEM -> OWNER HAVE PERMISSION TO ACCESS 
IF USER HAVE ROLE ADMIN -> USER HAVE PERMISSION TO ACCESS
*/

@Injectable()
class CompositeGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector
  ) { }
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const guards = this.reflector.get<TypeCompositeGuardDecorator[]>(NAME_DECORATOR_COMPOSITE, context.getHandler());
    if (!guards || guards.length === 0) {
      return true;
    }
    const results = await Promise.allSettled(guards.map(Guard => {
      const guard = new Guard(this.reflector);
      if(typeof guard.canActivate === "function"){
        return guard.canActivate(context);
      }
    }));
    let allGuardsFailed = true;
    for(let result of results){
      if(result.status === "rejected"){
        console.log("################## Error guard : ##################");
        console.log(result.reason);
      }
      if(result.status === "fulfilled" && result.value){
        allGuardsFailed = false;
      }
    }
    if (allGuardsFailed) {
      throw new HttpException('Access denied: All guards failed.', HttpStatus.FORBIDDEN);
    }
    return true;
  }
}

export const CompositeGuardMixin = () => mixin(CompositeGuard);
