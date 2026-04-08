import { Component } from '@angular/core';

interface Project {
  name: string;
  description: string;
  repoUrl: string;
  stack: string[];
}

@Component({
  selector: 'app-projects-section',
  standalone: true,
  templateUrl: './projects-section.component.html',
  styleUrl: './projects-section.component.sass',
})
export class ProjectsSectionComponent {
  protected readonly githubProfileUrl = 'https://github.com/nelsonsozinho';

  // First four repositories by creation date (oldest first) from GitHub public API.
  protected readonly projects: Project[] = [
    {
      name: 'grpc-json',
      description:
        'Simple Java project to compare the parser performance between JSON and Proto\n' + '\n',
      repoUrl: 'https://github.com/nelsonsozinho/grpc-json',
      stack: ['Java'],
    },
    {
      name: 'grpc-customer',
      description: 'gRPC Customer. Simple POC to try the access to service',
      repoUrl: 'https://github.com/nelsonsozinho/grpc-customer',
      stack: ['Java'],
    },
    {
      name: 'grpc-proto-service',
      description:
        'gRPC proto files. POC created solely to demonstrate some services and data types in .proto files ',
      repoUrl: 'https://github.com/nelsonsozinho/grpc-proto-service',
      stack: ['Proto'],
    },
    {
      name: 'bank-modules',
      description:
        'This project is fully didactic. It contains some architectural gaps, missing integrations, and several issues in the source code.',
      repoUrl: 'https://github.com/nelsonsozinho/bank-modules',
      stack: ['Java'],
    },
    {
      name: 'bank-modules',
      description:
        'Simple didactic proto project with .proto file description, service and consumer.',
      repoUrl: 'https://github.com/nelsonsozinho/proto_example',
      stack: ['Go'],
    },
  ];
}
