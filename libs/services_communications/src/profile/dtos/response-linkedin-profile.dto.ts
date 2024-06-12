import { ApiProperty } from '@nestjs/swagger';

export class ResponseEducationLinkedinProfile {
  @ApiProperty()
  date_range: string;

  @ApiProperty()
  degree: string;

  @ApiProperty()
  start_month: number;

  @ApiProperty()
  start_year: number;

  @ApiProperty()
  end_month: number;

  @ApiProperty()
  end_year: number;

  @ApiProperty()
  field_of_study: string;

  @ApiProperty()
  grade: string;

  @ApiProperty()
  school: string;
}

export class ResponseExperienceLinkedinProfile {
  @ApiProperty()
  company: string;

  @ApiProperty()
  company_linkedin_url: string;

  @ApiProperty()
  current_company_join_month?: number;

  @ApiProperty()
  current_company_join_year?: number;

  @ApiProperty()
  date_range: string;

  @ApiProperty()
  duration: string;

  @ApiProperty()
  end_month?: number;

  @ApiProperty()
  end_year?: number;

  @ApiProperty()
  is_current: boolean;

  @ApiProperty()
  location: string;

  @ApiProperty()
  start_month: number;

  @ApiProperty()
  start_year: number;

  @ApiProperty()
  title: string;
}

export class ResponseLinkedinProfile {
  @ApiProperty({
    example:
      "Hi, I'm Yousef El-Waer,\n\na passionate and dedicated Software Backend Engineer based in Giza, Egypt. With a strong educational background in Computer Engineering from Cairo University, I have developed a solid foundation in software development and backend engineering.\n\nThroughout my professional journey, I have gained valuable experience in various areas of software engineering, including DevOps, database management, full-stack development, and system administration. I have had the opportunity to work with cutting-edge technologies and tools, such as Kubernetes, Docker, Ansible, and Jenkins, to build scalable and efficient software solutions.\n\nI am a firm believer in continuous learning and staying up-to-date with the latest industry trends. I have actively participated in training programs, workshops, and certifications to enhance my skills and expand my knowledge in cloud computing, DevOps practices, and backend development.\n\nWhat sets me apart is my ability to tackle complex problems, collaborate effectively with cross-functional teams, and deliver high-quality solutions. I am passionate about leveraging technology to drive innovation and create impactful software solutions that address real-world challenges.\n\nOutside of work, I enjoy exploring new technologies, contributing to open-source projects, and keeping myself engaged in the ever-evolving world of software engineering.",
  })
  about: string;

  @ApiProperty({
    example: 'Giza, Egypt',
  })
  city: string;

  @ApiProperty({
    example: 'Dafa',
  })
  company: string;

  @ApiProperty({
    example: 'Egypt',
  })
  country: string;

  @ApiProperty({
    example: 3,
  })
  current_company_join_month: number;

  @ApiProperty({
    example: 2024,
  })
  current_company_join_year: number;

  @ApiProperty({ type: [ResponseEducationLinkedinProfile] })
  educations: ResponseEducationLinkedinProfile[];

  @ApiProperty()
  email: string;

  @ApiProperty({ type: [ResponseExperienceLinkedinProfile] })
  experiences: ResponseExperienceLinkedinProfile[];

  @ApiProperty({
    example: 'Yousef El-Waer',
  })
  full_name: string;

  @ApiProperty({
    example: 'Backend Engineer | (Nodejs & Nestjs), DevOps',
  })
  headline: string;

  @ApiProperty({
    example: 'BackEnd Engineer',
  })
  job_title: string;

  @ApiProperty({
    example: 'https://www.linkedin.com/in/yousef-elwaer',
  })
  linkedin_url: string;

  @ApiProperty({
    example: 'Giza, Al Jizah, Egypt',
  })
  location: string;

  @ApiProperty()
  phone?: string;

  @ApiProperty({
    example:
      'https://media.licdn.com/dms/image/D4D03AQHq-VFDDoX8Cw/profile-displayphoto-shrink_800_800/0/1697653967652?e=1718236800&v=beta&t=XqGUzKgEeNAKidJx2Cu9r9Hxs1NFzv-YxIO_vI9fNUY',
  })
  profile_image_url: string;

  @ApiProperty({
    example: 'yousef-elwaer',
  })
  public_id: string;

  @ApiProperty({
    example: 'Cairo University',
  })
  school: string;
}
