from app.models.skill import SkillLevel

def assess_skill_level(score: int) -> SkillLevel:
    if score < 4:
        return SkillLevel.beginner
    elif score < 7:
        return SkillLevel.intermediate
    else:
        return SkillLevel.pro
