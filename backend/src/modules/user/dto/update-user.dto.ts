export interface UpdateUserDto {
  name?: string;
  email?: string;
}
//The ? in TypeScript means “optional”. It tells
//  TypeScript that the property may or may not be present when you create an object of that type.