import { User } from '../interfaces/interfaces';

export const mockUsers: Record<number, User> = {
    1: { id: 1, name: "John Doe", email: "john@example.com" },
    2: { id: 2, name: "Jane Smith", email: "jane@example.com" },
    3: { id: 3, name: "Alice Johnson", email: "alice@example.com" }
};

let nextUserId = 4;

export async function fetchUserFromDatabase(id: number): Promise<User | null> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(mockUsers[id] || null);
        }, 200);
    });
}

export async function createUserInDatabase(name: string, email: string): Promise<User> {
    return new Promise((resolve) => {
        setTimeout(() => {
            const newUser: User = {
                id: nextUserId++,
                name,
                email
            };
            mockUsers[newUser.id] = newUser;
            resolve(newUser);
        }, 200);
    });
}
