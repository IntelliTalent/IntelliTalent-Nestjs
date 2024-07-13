import { Injectable } from '@nestjs/common';
import getConfigVariables from '@app/shared/config/configVariables.config';
import { Constants, getLinkedinProfileKey } from '@app/shared';
import { ResponseLinkedinProfile } from '@app/services_communications';
import { Redis } from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';

@Injectable()
export class LinkedinScrapperService {
  constructor(@InjectRedis() private readonly redis: Redis) {
  }

  async scrapLinkedinProfile(username: string) {
    // Check if the profile is in Redis
    const cachedProfile = await this.redis.get(getLinkedinProfileKey(username));
    if (cachedProfile) {
      return JSON.parse(cachedProfile);
    }

    const url = `https://www.linkedin.com/in/${username}`;
    const rapidApiKeys = await getConfigVariables(
      Constants.SCRAPPER.RAPIDAPI_KEY,
    ).split(',');


    const rapidApiKey = rapidApiKeys[Math.floor(Math.random() * rapidApiKeys.length)]

    const requestOptions = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'fresh-linkedin-profile-data.p.rapidapi.com',
      },
    };

    const queryParams = new URLSearchParams({
      linkedin_url: url,
      include_skills: 'false',
    });

    const apiUrl = `https://fresh-linkedin-profile-data.p.rapidapi.com/get-linkedin-profile?${queryParams}`;

    try {
      const response = await fetch(apiUrl, requestOptions);

      const { data } = await response.json();
      const res: ResponseLinkedinProfile = {
        about: data.about,
        city: data.city,
        company: data.company,
        country: data.country,
        current_company_join_month: data.current_company_join_month,
        current_company_join_year: data.current_company_join_year,
        email: data.email,
        full_name: data.full_name,
        headline: data.headline,
        job_title: data.job_title,
        linkedin_url: data.linkedin_url,
        location: data.location,
        phone: data.phone,
        profile_image_url: data.profile_image_url,
        public_id: data.public_id,
        school: data.school,
        educations: data.educations.map((education) => ({
          date_range: education.date_range,
          degree: education.degree,
          start_month: education.start_month,
          start_year: education.start_year,
          end_month: education.end_month,
          end_year: education.end_year,
          field_of_study: education.field_of_study,
          grade: education.grade,
          school: education.school,
        })),
        experiences: data.experiences.map((experience) => ({
          company: experience.company,
          company_linkedin_url: experience.company_linkedin_url,
          current_company_join_month: experience.current_company_join_month,
          current_company_join_year: experience.current_company_join_year,
          date_range: experience.date_range,
          duration: experience.duration,
          end_month: experience.end_month,
          end_year: experience.end_year,
          is_current: experience.is_current,
          location: experience.location,
          start_month: experience.start_month,
          start_year: experience.start_year,
          title: experience.title,
        })),
      };

      // Store the profile in Redis with a TTL of 1 day
      await this.redis.set(
        getLinkedinProfileKey(username),
        JSON.stringify(res),
        'EX',
        10 * 24 * 60 * 60,
      );

      return res;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}
