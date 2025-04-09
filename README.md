
# Problems in Current React Codebase

1. Inconsistent naming conventions: 
- Some files use camelCase (updateProduct.js), others use PascalCase (AdminSidebar.js) 
- Some components have plural names (Products.js), others singular (ViewProduct.js) 

2. Mixed file organization: 
- Multiple related files in the same directory without subfolders 
- Admin components appear to be in multiple folders without a clear hierarchy  

3. Component size and complexity: 
- Many components are very large with hundreds of lines of code 
- For example, NewProposal.js is over 1100 lines 

4. Duplicated code: 
- Similar pagination logic repeated across files
- Repeating IP and browser detection code

5. Form handling inconsistencies: 
- Using both formik and react-hook-form in different places 
- Some forms use state directly, others use form libraries

6. Flat structure within feature areas (e.g., admin/proposal contains multiple files)
No clear separation between:
- UI components
- Business logic
- API services
- Utilities

7. Repeated API call patterns with axios

8. Performance Optimization
Currently no measures are taken for code optimization

9. Bundle Size Optimization
Need measures for bundle size optimization

10. Consistent Error Handling
Need measures for Error handling in application and error boundaries


# Milestone 1
### Restructure code directories

src/
├── screens/                  
│   ├── login/                  
│   ├── dashboard/                          
│   ├── products/
│   ├── tickets/
│   └── ...
├── shared/                    
│   ├── components/            
│   ├── hooks/
│   ├── services/
│   ├── utils/
│   └── layouts/              
├── context/ 
├── config/                    
└── assets/                    

# Milestone 2
### Populating the structure with files

# Milestone 3
### Refactoring Code + Typescript injection

# Milestone 4
### UI/UX Revamp
