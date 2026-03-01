import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { WordRegistrationForm } from './components/WordRegistrationForm/WordRegistrationForm';

function App() {
  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          英単語登録
        </Typography>
        <WordRegistrationForm />
      </Box>
    </Container>
  );
}

export default App;
