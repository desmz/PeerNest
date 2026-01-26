import { Inject } from '@nestjs/common';

export const AchievementHandlers = Symbol.for('achievementHandlers');

export const InjectAchievementHandlers = (): ParameterDecorator => Inject(AchievementHandlers);
