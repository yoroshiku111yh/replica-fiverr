import { Body, Controller, Delete, Get, Post, Query, UseGuards } from '@nestjs/common';
import { SkillsService } from './skills.service';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/guards/jwt/jwt.guard';
import { RoleGuard } from 'src/guards/role/role.guard';
import { Roles } from 'src/decorators/role/roles.decorator';
import { ROLE_LEVEL } from 'ultil/types';
import { SkillsIdDto } from './dto/skills.dto';

@ApiTags("Skills [Role : ADMIN]")
@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) { }
  @Get("")
  getSkills() {
    return this.skillsService.getSkills();
  }

  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Need role admin to access" })
  @UseGuards(JwtGuard, RoleGuard)
  @Roles(ROLE_LEVEL.ADMIN)
  @Post("")
  postSkills(@Body() name_skills: string[]) {
    return this.skillsService.postSkills(name_skills);
  }

  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Need role admin to access" })
  @UseGuards(JwtGuard, RoleGuard)
  @Roles(ROLE_LEVEL.ADMIN)
  @Delete("")
  deleteSkills(@Body() skills_id: SkillsIdDto) {
    return this.skillsService.deleteSkill(skills_id.skillsId);
  }

  @Get("/search")
  @ApiQuery({ name: 'search', required: true, description: 'keyword skill' })
  searchByName(@Query("search") skillName: string) {
    return this.skillsService.searchByName(skillName);
  }
}
